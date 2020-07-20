using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Activities
{
    public class Attend
    {
        public class Command: IRequest
        {
            public Guid Id { get; set; } // activity id

        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                this._context = context;
                this._userAccessor = userAccessor;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {

                var activity = await _context.Activities.FindAsync(request.Id);

                if(activity == null)
                {
                    throw new RestException(System.Net.HttpStatusCode.NotFound, new { Activity = "Could not find activity" });
                }

                // not necessary to check if we have a user at this stage because to get here you would have to have been previously authorized
                // and will thus have a user token. So we can use  the token without checking ( could check if you wanted )
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());

                // check if attendance exists
                var attendance = _context.UserActivities.SingleOrDefaultAsync(x => x.ActivityId == activity.Id && x.AppUserId == user.Id).Result;

                if(attendance != null)
                {
                    throw new RestException(System.Net.HttpStatusCode.BadRequest, new { Attendance = "Already attending this activity" });
                }
                // attendance doesnt exists, create one
                attendance = new UserActivity
                {
                    Activity = activity,
                    AppUser = user,
                    IsHost = false,
                    DateJoined = DateTime.Now
                };

                _context.UserActivities.Add(attendance);

                var success = await this._context.SaveChangesAsync() > 0;

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
