using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {
    }

    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly IHttpContextAccessor httpContext;
        private readonly DataContext dataContext;

        public IsHostRequirementHandler(IHttpContextAccessor httpContext, DataContext dataContext)
        {
            this.httpContext = httpContext;
            this.dataContext = dataContext;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
        {
            var currentUserName = this.httpContext.HttpContext.User?.Claims.SingleOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            var activityId = Guid.Parse(httpContext.HttpContext.Request.RouteValues.SingleOrDefault(x => x.Key == "id").Value.ToString());

            var activity = this.dataContext.Activities.FindAsync(activityId).Result;

            var host = activity.UserActivities.FirstOrDefault(x => x.IsHost);

            // if the current user matches the username of the host, requirement passed
            if(host?.AppUser?.UserName == currentUserName)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
