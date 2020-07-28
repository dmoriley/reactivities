using Application.Interfaces;
using Application.Photos;
using Microsoft.AspNetCore.Http;
using System;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;
using CloudinaryDotNet.Actions;

namespace Infrastructure.Photos
{
    public class PhotoAccessor : IPhotoAccessor
    {
        private readonly Cloudinary _cloudinary;

        // IOptions allows us to get access to our user secrets
        public PhotoAccessor(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
           );

            // create new cloudinary account with our use settings.
           _cloudinary = new Cloudinary(acc);
        }

        public PhotoUploadResult AddPhoto(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if(file.Length > 0)
            {
                // use the using statement to dispose of the memory used once the operation inside has finished.
                // in this case were reading a file to memory, once that operation is finished because it is inside of a using
                // the stream object will be disposed and the memory will be freeed up
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face")
                    };
                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            if (uploadResult.Error != null)
            {
                throw new Exception(uploadResult.Error.Message);
            }

            return new PhotoUploadResult
            {
                PublicId = uploadResult.PublicId,
                Url = uploadResult.SecureUrl.AbsoluteUri
            };

        }

        public string DeletePhoto(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);

            var result = _cloudinary.Destroy(deleteParams);

            return result.Result == "ok" ? result.Result : null;
        }
    }
}
