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
        private readonly ISendGridProvider _sendGridProvider;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();

        public UserController(ILyricsProvider l, IUsersProvider u, IS3RecordProvider s, ISendGridProvider sg)
        {
            _lyricProvider = l;
            _S3Provider = s;
            _usersProvider = u;
            _sendGridProvider = sg;

            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        //[JwtAuthentication]
        [HttpPost, Route("users/login")]
        public HttpResponseMessage Login(UserLogin request)
        {
            if (request == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            var userLogin = _usersProvider.Login(request);
            if (userLogin == "")
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Email or password could not be found.");
            }

            return req.CreateResponse(HttpStatusCode.OK, userLogin);
        }

        //[HttpGet,Route("users/validate")]
        //public HttpResponseMessage Validate(UsersCreateRequest request)
        //{
        //    var exists = new UserRepository().GetUser(request.Name) != null;
        //}
        [HttpPost, Route("users")]
        public HttpResponseMessage Create(UsersCreateRequest request)
        {
            if (request == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            User user = _usersProvider.Create(request);

            if(user.Id == 0)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "The provided email is already being used.");
            }
           var resp= SendVerificationEmail(user);

            return req.CreateResponse(HttpStatusCode.OK, resp);
        }

        [HttpPost, Route("users/validate")]
        public HttpResponseMessage SendVerificationEmail(User user)
        {
            var response =  _sendGridProvider.SendVerification(user);
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

        [HttpGet, Route("userProfile/{id:int}")]
        public HttpResponseMessage GetUserProfile(int id)
        {
            var lyric = _usersProvider.GetUserProfile(id);
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

        [HttpPut, Route("users/passwordResetRequest")]
        public async Task<HttpResponseMessage> SendEmail(User request)
        {
            var result = await _sendGridProvider.SendPasswordReset(request);

            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpPut, Route("users/updatePassword")]
        public HttpResponseMessage UpdatePassword(UsersUpdateRequest request)
        {
            var result = _usersProvider.UpdatePassword(request);
            if (!result)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "User or Password does not match current data.");
            }
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpGet, Route("expire-check/{key}")]
        public HttpResponseMessage CheckExpireDate(string key)
        {
            UserKeyExpireCheck result = _sendGridProvider.CheckExpireDate(key);

            if (result.ExpireBoolean == false)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, result);
            }
            else

                return Request.CreateResponse(HttpStatusCode.OK, result);
        }
    }
}