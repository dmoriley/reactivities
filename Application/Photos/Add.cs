using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Photos
{
    public class Add
    {
        // normally in a command we dont return anything. But this case is special because the image URI we get from cloudinary we can't generate
        // we need it from the source. So were going to return that.
        public class Command: IRequest<Photo>
        {
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Photo>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IPhotoAccessor _photoAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor, IPhotoAccessor photoAccessor)
            {
                this._context = context;
                this._userAccessor = userAccessor;
                this._photoAccessor = photoAccessor;
            }

            public async Task<Photo> Handle(Command request, CancellationToken cancellationToken)
            {

                var photoUploadResult = _photoAccessor.AddPhoto(request.File);

                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());

                var photo = new Photo
                {
                    Url = photoUploadResult.Url,
                    Id = photoUploadResult.PublicId
                };

                if (!user.Photos.Any(x => x.IsMain))
                {
                    photo.IsMain = true;
                }

                // when we get our use from the context, it is then being tracked so when we add a photo the user is being updated and when we save our changes
                // its going to save our user and the photo into the users collection.
                user.Photos.Add(photo);

                var success = await this._context.SaveChangesAsync() > 0;

                if(success)
                {
                    return photo;
                } 
                else
                {
                    throw new Exception("Problem adding photo");
                }
            }
        }
    }
}
