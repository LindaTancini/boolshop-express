const multer = require('multer');
const slugify = require('slugify');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/cover')
    },
    filename: function (req, file, cb) {


        const slugifyName = slugify(file.originalname, {
            replacement: '-',  // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true,      // convert to lower case, defaults to `false`
            strict: false,     // strip special characters except replacement, defaults to `false`
            locale: 'vi',      // language code of the locale to use
            trim: true         // trim leading and trailing replacement chars, defaults to `true`
        });
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${slugifyName}`
        cb(null, uniqueName)
    }
})

const upload = multer({ storage })

module.exports = upload;