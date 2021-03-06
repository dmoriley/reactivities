﻿using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;

namespace Application.Photos
{
    public class Delete
    {
        public class Command: IRequest
        {
            public string Id { get; set; }
        }
        
        public class Handler : IRequestHandler<Command>
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

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {

                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());

                var photo = user.Photos.FirstOrDefault(x => x.Id == request.Id);

                if (photo == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new { Photo = "Not Found" });
                }

                if (photo.IsMain)
                {
                    throw new RestException(HttpStatusCode.BadRequest, new { Photo = "You cannot delete your main photo" });
                }

                // delete from cloudinary
                var result = _photoAccessor.DeletePhoto(photo.Id);

                if (result == null)
                {
                    throw new Exception("Problem deleting photo");
                }

                // remove from url from database
                user.Photos.Remove(photo);
        
                var success = await this._context.SaveChangesAsync() > 0;
        
                if (success)
                {
                    return Unit.Value;
                } 
                else
                {
                    throw new Exception("Problem saving changes");
                }
            }
        }
    }
}
