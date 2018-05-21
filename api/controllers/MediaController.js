/**
 * MediaController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    uploadFile: async (req, res) => {

        let { dir } = req.body;

        // if network is throttled on the client, req.body is empty {}
        sails.log("uploading:::", req.body)

        // check if dir is not provided by the client, just upload it to ./public/media/ directory
        // for this tested issue, client should send dir="/test" to upload to ./public/media/test directory
        if (!dir) {
            dir = '/';
        }

        req.file('fileUpload').upload({
            maxBytes: 100000000, // don't allow the total upload size to exceed ~100MB
            dirname: require('path').resolve(sails.config.appPath, 'public/media/' + dir), // change the dirname if specified fron client. default is ./public/media/
            saveAs: (__newFileStream, next) => {
                // rename file using their original name.
                return next(undefined, __newFileStream.filename);
            }
        }, async (err, uploadedFiles) => {

            // if any error, return server error
            if (err) {
                return res.serverError(err);
            }

            // If no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0) {
                return res.badRequest('No file was uploaded');
            }

            // adding to database!
            // no need this step to reproduce the issues
            // const preparedFiles = await Promise.all(
            //     uploadedFiles.map(async file => {

            //         // saving data to database.
            //         // const newMedia = await Media.create({
            //         //     url: require('util').format('%smedia%s', sails.config.custom.baseUrl, `${dir != '/' ? dir : ''}/` + file.filename).replace(/ /g, '%20'),
            //         //     dir: dir,
            //         //     resize,
            //         //     ...file
            //         // }).fetch();

            //         // return newMedia;
            //     })
            // );


            // The upload is always success! but the dir param is missing somehow the network is throttled. (slow network)
            return res.ok({
                message: uploadedFiles.length + ' file(s) uploaded successfully!',
                files: uploadedFiles
            });

        })

    },

};

