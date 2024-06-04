import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {validate as isUUID} from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { paginationDto } from 'src/common/dtos/pagination.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const {images = [], ...productDetails} = createProductDto;

      const product = this.productRepository.create({ 
      ...productDetails, 
      images: images.map( image => this.productImageRepository.create({ url: image }))
      });
      await this.productRepository.save( product );

      return {...product, images};

    } catch (error) {
      this.handleDbExeptions(error)
    }
    
  }

  async findAll( paginationDto: paginationDto ) {

    const {limit = 10, offset = 0} = paginationDto

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    }) 
    
    return products.map( ( product ) => ({
      ...product,
      images: product.images.map( img => img.url)
    }) )
  }

  async findOne( term: string ) {

    let product: Product;

    if( isUUID( term ) ){
      product = await this.productRepository.findOneBy({ id: term });
    }
    else{
      const queryBuilder = await this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
      .where('UPPER(title) =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      })
      .leftJoinAndSelect('prod.images', 'prodImage')
      .getOne()
    }

    if( !product ) 
      throw new NotFoundException(`Product whit id ${ term } not found`)

    return product;
  }

  async findOnePlain( term: string ) {

    const product = await this.findOne( term )
    return{
      ...product,
      images: product.images.map( image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate })

    if( !product ) throw new NotFoundException(`product whit id ${ id } not found`)

      // Create query runner
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

    try {

      if ( images ){
        await queryRunner.manager.delete( ProductImage, { product: {id} } )

        product.images = images.map( image => this.productImageRepository.create( {url: image} ))

      }

      await queryRunner.manager.save( product );
      // await this.productRepository.save( product )

      await queryRunner.commitTransaction();
      await queryRunner.release()

      return this.findOnePlain( id );
      
    } catch (error) {

      queryRunner.rollbackTransaction()
      queryRunner.release()

      this.handleDbExeptions( error )
    }

  }

  async remove( id: string ) {
    const product = await this.findOne( id )
    await this.productRepository.remove( product )
  }
 
  private handleDbExeptions(error: any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    //console.log(error)
    this.logger.error(error)
    throw new InternalServerErrorException(`unexpected error, check server logs!`)
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute();
      
    } catch (error) {
      this.handleDbExeptions( error )
    }
  }
}
