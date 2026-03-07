import multer from "multer";

// Configure multer to use memory storage since we will upload to cloudinary immediately.
const storage = multer.memoryStorage();

// File filter to allow only PDFs and Images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."));
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
    fileFilter,
});

export default upload;
