using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;

        public ChatHub(IMediator mediator)
        {
            this._mediator = mediator;
        }

        // in http controller the important part is the name of the route, route type and the route parameters, not the method name
        // but in the Hub its the name of the method that will invoke it.
        public async Task SendComment(Create.Command command)
        {
            string username = GetUsername();

            command.Username = username;

            // comment saved to database
            var comment = await _mediator.Send(command);

            // comment then to the group subscribed
            await Clients.Group(command.ActivityId.ToString()).SendAsync("ReceiveComment", comment);
        }

        private string GetUsername()
        {
            // getting the username from the JWT token claims
            return Context.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        public async Task AddToGroup(string groupName)
        {
            // add the user to the group to receive emissions
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            var username = GetUsername();

            await Clients.Group(groupName).SendAsync("Send", $"{username} has joined the group");
        }
        public async Task RemoveFromGroup(string groupName)
        {
            // remove the user from the group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            var username = GetUsername();

            await Clients.Group(groupName).SendAsync("Send", $"{username} has left the group");
        }
    }
}
