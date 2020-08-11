using Application.Errors;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Comments
{
    public class Create
    {
        // again normally commands dont usually return something, but the case of comments is special
        public class Command: IRequest<CommentDto>
        {
            public string Body { get; set; }
            public Guid ActivityId { get; set; }
            public string Username { get; set; } // need username because this command isnt called by the usual http request that would have authentication attached.
        }

        public class Handler : IRequestHandler<Command, CommentDto>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                this._context = context;
                this._mapper = mapper;
            }

            public async Task<CommentDto> Handle(Command request, CancellationToken cancellationToken)
            {

                var activity = await _context.Activities.FindAsync(request.ActivityId);

                if(activity == null)
                {
                    throw new RestException(System.Net.HttpStatusCode.NotFound, new { Activity = "Not Found" });
                }

                // cant use user accessor because that relies on the http context, and were not using http with singleR,
                // but websockets, we dont have access to http context
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == request.Username);

                var comment = new Comment
                {
                    Author = user,
                    Activity = activity,
                    Body = request.Body,
                    CreatedAt = DateTime.Now
                };

                activity.Comments.Add(comment);

                var success = await this._context.SaveChangesAsync() > 0;

                if(success)
                {
                    return _mapper.Map<CommentDto>(comment);                } 
                else
                {
                    throw new Exception("Problem saving changes");
                }
            }
        }
    }
}
