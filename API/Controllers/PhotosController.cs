﻿using Application.Photos;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    public class PhotosController : BaseController
    {
        [HttpPost]
        public async Task<ActionResult<Photo>> Add([FromForm]Add.Command command)
        {
            // some reason need to tell method too specifically look for the File value in the Form.
            return await Mediator.Send(command);
        }

        [HttpDelete("{Id}")]
        public async Task<ActionResult<Unit>> Delete(string Id)
        {
            return await Mediator.Send(new Delete.Command { Id = Id });
        }

        [HttpPost("{id}/setmain")]
        public async Task<ActionResult<Unit>> SetMain(string id)
        {
            return await Mediator.Send(new SetMain.Command { Id = id });
        }
    }
}
