const express = require('express');


const {grantAccess,
      redirect,
      getToken,
      getFiles,
      grantDropBoxAccess,
      dropBoxredirect,
      getreply,
      dbGetToken,
      uploadToDropBox,
      uploadToGoogle,
      downloadGoogleFile,
      downloadBoxFile,
      deleteGoogleFile,
      deleteBoxFile
    } = require('../controllers/Controller');



const router = express.Router();

router.route('/grant-access').get(grantAccess);
router.route('/grant-dropbox-access').get(grantDropBoxAccess);
router.route('/redirect').get(redirect);
router.route('/dropbox-redirect').get(dropBoxredirect);
router.route('/get-google-token').get(getToken);
router.route('/get-dropbox-token').get(dbGetToken);
router.route('/get-files').post(getFiles);
router.route('/get-reply').post(getreply);
router.route('/upload-google').post(uploadToGoogle);
router.route('/upload-dropbox').post(uploadToDropBox);
router.route('/download-google').post(downloadGoogleFile);
router.route('/download-box').post(downloadBoxFile);
router.route('/delete-google').post(deleteGoogleFile);
router.route('/delete-box').post(deleteBoxFile);
module.exports = router;