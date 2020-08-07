using MediatR;
using System.Threading.Tasks;
using System.Threading;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Identity;
using System.Linq;

namespace Application.User
{
    public class CurrentUser
    {
        public class Query : IRequest<User> { }
        
        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly IJwtGenerator _jwtGenerator;
            private readonly IUserAccessor _userAccessor;
            public Handler(UserManager<AppUser> userManager, IJwtGenerator jwtGenerator, IUserAccessor userAccessor)
            {
                _userManager = userManager;
                _jwtGenerator = jwtGenerator;
                _userAccessor = userAccessor;
            }
        
            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                // able to find user on httpcontext because at this point the authentication has been resolved on this route
                // and the user object is inside the http context
                var user = await _userManager.FindByNameAsync(_userAccessor.GetCurrentUsername());

                return new User
                {
                    DisplayName = user.DisplayName,
                    Username = user.UserName,
                    Token = _jwtGenerator.CreateToken(user),
                    Image = user.Photos.FirstOrDefault(x => x.IsMain)?.Url
                };
            }
        }
    }
}
