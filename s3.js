const S3 = require('aws-sdk/clients/s3')
const bucketName = process.env.AWS_Bucket_Name
const accessKeyId = process.env.AWS_Access_KeyId
const secretKeyId = process.env.AWS_Secret_Key
const fs = require('fs')
AWS_Region="ap-southeast-1"

const s3 = new S3 ({
  region: AWS_Region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretKeyId
})

// Upload image to S3
const uploadImage = (file) => {
  const fileStream = fs.createReadStream(file.path)

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename
  }

  return s3.upload(uploadParams).promise()

}

// Download image
const downloadImage = (key) => {
  params = {
    Bucket: bucketName,
    Key: key
  }
  return s3.getObject(params).promise()
}

// Delete Image 
const deleteImage = (key) => {
  params = {
    Bucket: bucketName,
    Key: key
  }

  return s3.deleteObject(params).promise()
}

exports.uploadImage = uploadImage
exports.downloadImage = downloadImage
exports.deleteImage = deleteImage