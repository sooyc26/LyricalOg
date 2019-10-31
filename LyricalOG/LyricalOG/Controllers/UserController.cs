using LyricalOG.Interfaces;
using LyricalOG.Models;
using LyricalOG.Models.Users;
using LyricalOG.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace LyricalOG.Controllers
{

    [AllowAnonymous]
    [RoutePrefix("api")]
    //[EnableCors(origins: "*", headers: "*", methods: "*")]
    public class UserController : ApiController
    {
        private readonly IUsersProvider _usersProvider;
        private readonly ILyricsProvider _lyricProvider;
        private readonly IS3RecordProvider _S3Provider;
        private readonly SendGridService _sendGridService;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();

        public UserController(ILyricsProvider l, IUsersProvider u, IS3RecordProvider s)
        {
            _lyricProvider = l;
            _S3Provider = s;
            _usersProvider = u;
            _sendGridService = new SendGridService();

            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        [HttpPost, Route("users/login")]
        public HttpResponseMessage Login(UserLogin request)
        {
            if (request == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            var userLogin = _usersProvider.Login(request);

            return req.CreateResponse(HttpStatusCode.OK, userLogin);
        }

        [HttpPost, Route("users")]
        public HttpResponseMessage Create(UsersCreateRequest request)
        {
            if (request == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            int id = _usersProvider.Create(request);

            return req.CreateResponse(HttpStatusCode.OK, id);
        }

        [HttpGet, Route("users/validate/{id:int}")]
        public HttpResponseMessage ValidateUser(int id)
        {
            var userInfo = _usersProvider.ReadById(id);
            var response = _usersProvider.EmailValidation(userInfo);
            return req.CreateResponse(HttpStatusCode.OK, response);
        }
        [HttpGet, Route("users")]
        public HttpResponseMessage ReadAll()
        {
            var lyrics = _usersProvider.ReadAll();
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }

        [HttpGet, Route("users/{id:int}")]
        public HttpResponseMessage ReadById(int id)
        {
            var lyric = _usersProvider.ReadById(id);
            return req.CreateResponse(HttpStatusCode.OK, lyric);
        }

        [HttpPut, Route("users/{id:int}")]
        public HttpResponseMessage UpdateById(UsersUpdateRequest request, int id)
        {
            var retId = _usersProvider.UpdateUser(request, id);
            return Request.CreateResponse(HttpStatusCode.OK, retId);
        }

        [HttpDelete, Route("users/{id:int}")]
        public HttpResponseMessage Delete(int id)
        {
            var retId = _usersProvider.Delete(id);
            //_lyricService.Delete(id);
            _usersProvider.Delete(id);

            var message = "deleted Id: " + retId;
            return Request.CreateResponse(HttpStatusCode.OK, message);
        }

        [HttpPut, Route("resetPassword")]
        public async Task<HttpResponseMessage> SendEmail(User request)
        {
            var result = await _sendGridService.SendEmail(request);

            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpGet, Route("expire-check/{key}")]
        public HttpResponseMessage CheckExpireDate(string key)
        {
            UserKeyExpireCheck result = _sendGridService.CheckExpireDate(key);

            if (result.ExpireBoolean == false)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, result);
            }
            else

                return Request.CreateResponse(HttpStatusCode.OK, result);
        }
    }
}