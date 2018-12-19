using myCrudApp.Models;
using myCrudApp.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace myCrudApp.Controllers
{

    [AllowAnonymous]
    [RoutePrefix("api")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class UserController : ApiController
    {
        readonly UserService _userService;
        readonly LyricService _lyricService;
        readonly RecordService _recordService;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();

        public UserController()
        {
            _lyricService = new LyricService();
            _recordService = new RecordService();
            _userService = new UserService();
            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        [HttpPost, Route("users")]
        public HttpResponseMessage Create(UsersCreateRequest request)
        {
            if (request == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            int id = _userService.Create(request);

            return req.CreateResponse(HttpStatusCode.OK, id);
        }

        [HttpGet, Route("users")]
        public HttpResponseMessage ReadAll()
        {
            var lyrics = _userService.ReadAll();
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }

        [HttpGet, Route("users/{id:int}")]
        public HttpResponseMessage ReadById(int id)
        {
            var lyric = _userService.ReadById(id);
            return req.CreateResponse(HttpStatusCode.OK, lyric);
        }

        [HttpPut, Route("users/{id:int}")]
        public HttpResponseMessage UpdateById(UsersUpdateRequest request, int id)
        {
            var retId = _userService.UpdateUser(request, id);
            return Request.CreateResponse(HttpStatusCode.OK, retId);
        }

        [HttpDelete, Route("users/{id:int}")]
        public HttpResponseMessage Delete(int id)
        {
            var retId = _userService.Delete(id);
            //_lyricService.Delete(id);
            _recordService.Delete(id);

            var message = "deleted Id: " + retId;
            return Request.CreateResponse(HttpStatusCode.OK, message);
        }
    }
}