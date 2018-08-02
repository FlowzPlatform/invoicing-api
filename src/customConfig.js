module.exports = {
    default : {
        userDetailURL : "http://api."+ process.env.domainKey +"/auth/api/userdetails",
        cloudinary_cloud_name : process.env.cloudinary_cloud_name,
        cloudinary_api_key : process.env.cloudinary_api_key,
        cloudinary_api_secret : process.env.cloudinary_api_secret
    }
}