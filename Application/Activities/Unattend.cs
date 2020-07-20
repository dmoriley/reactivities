using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class Unattend
    {
        public class Command: IRequest
        {
            public Guid Id { get; set;}
        }
        
        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
                    {
                        _context = context;                
                        _userAccessor = userAccessor;
            }
        
            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {

                var activity = await _context.Activities.FindAsync(request.Id);

                if (activity == null)
                {
                    throw new RestException(System.Net.HttpStatusCode.NotFound, new { Activity = "Could not find activity" });
                }

                // not necessary to check if we have a user at this stage because to get here you would have to have been previously authorized
                // and will thus have a user token. So we can use  the token without checking ( could check if you wanted )
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());

                // check if attendance exists
                var attendance = _context.UserActivities.SingleOrDefaultAsync(x => x.ActivityId == activity.Id && x.AppUserId == user.Id).Result;

                if (attendance == null)
                {
                    return Unit.Value; // dont need to remove them again. 
                }

                // host cannot remove themselves
                if( attendance.IsHost)
                {
                    throw new RestException(System.Net.HttpStatusCode.BadRequest, new { Attendance = "You cannot remove yourself as host." });
                }

                // passes all checks remove attendance
                _context.UserActivities.Remove(attendance);

                var success = await _context.SaveChangesAsync() > 0;

                if(success)
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
