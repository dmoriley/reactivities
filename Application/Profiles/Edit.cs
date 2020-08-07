using Application.Errors;
using Application.Interfaces;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;


namespace Application.Profiles
{
    public class Edit
    {
        public class Command: IRequest
        {
            public string DisplayName { get; set; }
            public string Bio { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName).NotEmpty();
            }
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

                var user = await this._context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());

                if (user == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new { Profile = "Not Found" });
                }

                user.DisplayName = request.DisplayName;
                user.Bio = request.Bio;

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
