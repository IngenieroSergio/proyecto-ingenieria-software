

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function ) =>{

    console.log({ file })

    callback( null, true )
}