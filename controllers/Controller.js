const fs = require('fs');
const path = require('path');
// const fetch = require('node-fetch');
const {google} = require('googleapis');
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved
const axios =require("axios")
const{ Configuration, OpenAIApi }=require("openai");

const keyPath = path.join('/Users/user/Desktop/cloudsurf/newcred.json');


let keys = {redirect_uris: ['']};
if (fs.existsSync(keyPath)) {
     console.log("iiii")
  keys = require(keyPath).web;

}

const configuration = new Configuration({
     organization: "org-zIS2Jwi4QvO5w6IynStMtT2r",
     apiKey: "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",
 });

 const openai = new OpenAIApi(configuration);


const oauth2Client = new google.auth.OAuth2(
     keys.client_id,
     keys.client_secret,
     keys.redirect_uris[0]
   );
google.options({auth: oauth2Client});

 const config = {
     axios,
     clientId: 'v3oas37ww9v1wzl',
     clientSecret: '4ygakug87e9122d',
   };
const dbx = new Dropbox(config);

exports.grantAccess= async (req, res, next) => {
     try{
          const url = oauth2Client.generateAuthUrl({
               access_type: "offline",
               scope: [
               "https://www.googleapis.com/auth/userinfo.profile",
               "https://www.googleapis.com/auth/drive"
               ],
          });
          // res.redirect (url);
          console.log(url)
          res.status(200).json({
             status: 'success',
              url
           });

     }catch(e){

     }



}


exports.grantDropBoxAccess= async (req, res, next) => {
     try{
          const url =await dbx.auth.getAuthenticationUrl("http://localhost:3002/dropbox-redirect", null, 'code', 'offline', null, 'none', false)
           console.log(url,"uuuu")
          // res.redirect (url);
          console.log(url)
          res.status(200).json({
             status: 'success',
              url
           });

     }catch(e){

     }



}
exports.redirect= async (req, res, next) => {
     
     try{
          const { code} = req.query;
          console.log(code)
         
          const { tokens } = await oauth2Client.getToken(code)
          console.log(tokens)
          oauth2Client.setCredentials (tokens)
          fs.writeFileSync("token.json",JSON.stringify({}))
          fs.writeFileSync("token.json",JSON.stringify(tokens))
          // res.status(200).json({
          //      status: 'success',
          //      tokens
          //    });
         res.redirect ("http://127.0.0.1:5174/google-redirect");

     }catch(e){
          console.log(e)
     }


    


}

exports.dropBoxredirect= async (req, res, next) => {
   
     try{
          const { code} = req.query;
          console.log(code)
        const token=  await dbx.auth.getAccessTokenFromCode("http://localhost:3002/dropbox-redirect", code)
        fs.writeFileSync("dbtoken.json",JSON.stringify({}))
        fs.writeFileSync("dbtoken.json",JSON.stringify(token))
         res.redirect ("http://127.0.0.1:5174/dropbox-redirect");

     }catch(e){
          console.log(e)
     }


    


}

exports.getToken= async (req, res, next) => {
  
     try{
          fs.readFile("token.json", 'utf8', (err, data) => {
               if (err) {
                  console.log(err)
               } else {
                 try {
                   const jsonData = JSON.parse(data);
                   console.log(jsonData,"json")
                 res.status(200).json({
                    status: 'success',
                    jsonData 
                  });
                    
                 } catch (e) {
                   console.log(e)
                 }
               }
             });

     }catch(e){
          console.log(e)
     }

}


exports.dbGetToken= async (req, res, next) => {
          try{
               fs.readFile("dbtoken.json", 'utf8', (err, data) => {
                    if (err) {
                       console.log(err)
                    } else {
                      try {
                        const jsonData = JSON.parse(data);
                        console.log(jsonData,"json")
                      res.status(200).json({
                         status: 'success',
                         jsonData 
                       });
                         
                      } catch (e) {
                        console.log(e)
                      }
                    }
                  });
     
          }catch(e){
               console.log(e)
          }
     


}


exports.getFiles= async (req, res, next) => {
     
     const {googleToken, dropboxToken,googleExpire,dropboxExpire}=req.body
     console.log(googleToken, dropboxToken,googleExpire,dropboxExpire)
     // console.log(new Date().setSeconds(googleExpire) < new Date().setSeconds())
     // console.log(new Date().setSeconds(googleExpire))
    
          try{
             let box=[]
             let drives=[]
           if(googleToken?.length >0 && googleToken !=undefined){
               try{
                    oauth2Client.setCredentials({
                         refresh_token: googleToken
                    });
                    
                    const drive = google.drive({
                         version: 'v3',
                         auth: oauth2Client
                         });
               
                    
                    
                         const listParams = {};
                         const response = await drive.files.list(listParams);
                         drives.push(...response.data.files)
                         // console.log(drives,"dd")

                    }catch(e){
                         console.log(e.message)
                    }
     
                }
            
               if(dropboxToken?.length >0 && dropboxToken !=undefined ){
                    try{
                         const dbxl = new Dropbox({ accessToken: dropboxToken });
                         const res1= await dbxl.filesListFolder({path: ''})
                       box.push(...res1?.result?.entries)
                       console.log(box,"boxx")
                      }catch(e){
                         console.log(e.message)
                     }
           
                    

                   }
          
                   console.log(box,"boxx")
               const files=[...box,...drives]
               // console.log(files,"file")
               
                res.status(200).json({
                    status: 'success',
                    files
                  });
                   
              } catch (e) {
              console.log(e)
            }
          }
     
     






exports.getreply= async (req, res, next) => {
     const {text} =req.body
     try{
          const response = await openai.createChatCompletion({
               model: "gpt-3.5-turbo",
               messages: [{role: "user", content:text}]
            });
     
          //   console.log(response.data.choices[0])
            res.status(200).json({
               status: 'success',
              response: response?.data?.choices[0]?.message?.content
             });
     }catch(e){
          console.log(e)
     }



}


exports.uploadToGoogle= async (req, res, next) => {
     console.log(req.file,"gg");
     console.log(JSON.parse(req.body.data),"k")
  


     // const uploadDir = path.join('uploads',req.file.originalname)

     //   oauth2Client.setCredentials({
     //      refresh_token: googleToken
     //    });
      
     //    const drive = google.drive({
     //      version: 'v3',
     //      auth: oauth2Client
     //      });

     // const requestBody = {
     //      name: req.file.originalname,
         
     //    };
     //    const media = {
     //      body: fs.createReadStream(uploadDir),
     //    };
     //  const file = await drive.files.create({
     //      requestBody,
     //      media: media,
     //    });
     // console.log(file,"filllll")

}


exports.uploadToDropBox= async (req, res, next) => {
     // console.log(req.file,"gg");
     const uploadDir = path.join('uploads',req.file.originalname)

}


exports.downloadGoogleFile= async (req, res, next) => {
   
     try{   
          const {id,mimetype,token}=req.body
          console.log(req.body)
          console.log(mimetype.slice(0,11))
          console.log(id,token)

          oauth2Client.setCredentials({
               refresh_token: token
          });
          
          const drive = google.drive({
               version: 'v3',
               auth: oauth2Client
          });
          

          if(mimetype !="application/vnd.google-apps.document"){
               console.log("first")
               const file = await drive.files.get({
                    fileId: id,
                    // alt: 'media',
                    fields: 'webContentLink'
                   
                    });
                    console.log(file);
                    res.status(200).json({
                         status: 'success',
                         fileLink:file.data.webContentLink
                    });
                 
               
          }else{
               console.log("second")
               const file = await drive.files.export({
                    fileId: id,
                    mimeType: `${mimetype}`,
                    fields: 'exportLinks'
                    });
               console.log(file);
               res.status(200).json({
                    status: 'success',
                    fileLink:file.data.webContentLink
               });

          }
          
    


     }catch(e){
          console.log(e)
     }
  

}



exports.downloadBoxFile= async (req, res, next) => {

     try{
          
          const {pathfile,token}=req.body
          const dbxl = new Dropbox({ accessToken: token });
          const response= await dbxl.filesDownload({path:pathfile})
          console.log(response)
          var fileName = response.result.name;
          const publicDir = path.join('public',fileName)
          fs.writeFile(publicDir, response.result?.fileBinary, function (err, data) {
            if (err) throw err;
            console.log(data);
        });
        var fullUrl = req.protocol + '://' + req.get('host')
        res.status(200).json({
          status: 'success',
          fileLink:`${fullUrl}/${fileName}`
     });
        console.log(`${fullUrl}/${fileName}`)
     
     }catch(e){
          console.log(e)
     }
     
}





exports.deleteGoogleFile= async (req, res, next) => {
     const {id,mimetype,token}=req.body

      try{
               oauth2Client.setCredentials({
                    refresh_token: token
               });
               
               const drive = google.drive({
                    version: 'v3',
                    auth: oauth2Client
               });


               const file = await drive.files.delete({
                    fileId: id,
                    // alt: 'media',
                   
                   
                    });
                    const done=file.statusText=="No Content"
                    res.status(200).json({
                         status: 'success',
                         response:done
                    });
                 
          }catch(e){
               console.log(e)
          }

}



exports.deleteBoxFile= async (req, res, next) => {


     try{
          
          const {pathfile,token}=req.body
          const dbxl = new Dropbox({ accessToken: token });
          const response= await dbxl.filesDeleteV2({path:pathfile})
          console.log(response.status==200)
          const done=response.status==200
          res.status(200).json({
               status: 'success',
               response:done
          });
         
     
     }catch(e){
          console.log(e)
     }

}