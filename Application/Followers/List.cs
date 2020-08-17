using Application.Profiles;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Followers
{
    public class List
    {
        public class Query : IRequest<List<ProfileDto>> 
        {
            public string Username { get; set; }

            // identify if profile of user the current user is following or a follower of
            // get this param from query string instead of body parameter
            public string Predicate { get; set; }
        }
        
        public class Handler : IRequestHandler<Query, List<ProfileDto>>
        {
            private readonly DataContext _context;
            private readonly IProfileReader _profileReader;

            public Handler(DataContext context, IProfileReader profileReader)
            {
                _context = context;
                this._profileReader = profileReader;
            }
        
            public async Task<List<ProfileDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var queryable = _context.Followings.AsQueryable(); // doesnt access the db yet, just sets up a query object to use later

                var userFollowings = new List<UserFollowing>();
                var profiles = new List<ProfileDto>();

                switch(request.Predicate)
                {
                    case "followers" :
                        userFollowings = await queryable.Where(x => x.Target.UserName == request.Username).ToListAsync();

                        foreach(var follower in userFollowings)
                        {
                            profiles.Add(await _profileReader.ReadProfile(follower.Observer.UserName));
                        }
                        break;

                    case "following":
                        userFollowings = await queryable.Where(x => x.Observer.UserName == request.Username).ToListAsync();

                        foreach (var follower in userFollowings)
                        {
                            profiles.Add(await _profileReader.ReadProfile(follower.Target.UserName));
                        }
                        break;
                }

                return profiles;
            }
        }
    }
}
