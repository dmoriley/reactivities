using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;


namespace Application.Profiles
{
    public class Details
    {
        public class Query : IRequest<ProfileDto> 
        {
            public string Username { get; set; }
        }
        
        public class Handler : IRequestHandler<Query, ProfileDto>
        {
            private readonly IProfileReader _profileReader;

            public Handler(IProfileReader profileReader)
            {
                this._profileReader = profileReader;
            }
        
            public async Task<ProfileDto> Handle(Query request, CancellationToken cancellationToken)
            {
                return await _profileReader.ReadProfile(request.Username);
            }
        }
    }
}
