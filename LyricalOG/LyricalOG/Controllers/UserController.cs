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
    [RoutePrefix("users")]
    public class UserController : ApiController
    {
        private readonly IUsersProvider _usersProvider;
        private readonly ISendGridProvider _sendGridProvider;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();

        public UserController(IUsersProvider u, ISendGridProvider sg)
        {
            _usersProvider = u;
            _sendGridProvider = sg;

            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        [HttpGet, Route("validate/{key}")]
        public HttpResponseMessage AccountValidation(string key)
        {
            var response = _usersProvider.ValidateAccount(key);
            if (!response)
            {
                return Request.CreateResponse(HttpStatusCode.Forbidden, "Provided Key does not match, please try again.");
            }
            return req.CreateResponse(HttpStatusCode.OK, response);
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

        [HttpPost]
        public async Task<HttpResponseMessage> Create(UsersCreateRequest request)
        {
            if (request == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            User user = _usersProvider.Create(request);

            if (user.Id == 0)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "The provided email is already being used.");
            }
            var resp = await _sendGridProvider.SendVerification(user);

            return req.CreateResponse(HttpStatusCode.OK, resp);
        }


        [HttpDelete, Route("{id:int}")]
        public HttpResponseMessage Delete(int id)
        {
            var retId = _usersProvider.Delete(id);
            //_lyricService.Delete(id);
            _usersProvider.Delete(id);

            var message = "deleted Id: " + retId;
            return Request.CreateResponse(HttpStatusCode.OK, message);
        }

        [HttpGet, Route("profile/{id:int}")]
        public HttpResponseMessage GetUserProfile(int id)
        {
            var lyric = _usersProvider.GetUserProfile(id);
            return req.CreateResponse(HttpStatusCode.OK, lyric);
        }

        //[JwtAuthentication]
        [HttpPost, Route("login")]
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


        [HttpPut, Route("passwordReset")]
        public HttpResponseMessage PasswordReset(UsersUpdateRequest request)
        {
            var result = _usersProvider.PasswordReset(request);
            if (!result)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "User Not found, please log out and try again.");
            }
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpGet]
        public HttpResponseMessage ReadAll()
        {
            var lyrics = _usersProvider.ReadAll();
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }

        [HttpGet, Route("{id:int}")]
        public HttpResponseMessage ReadById(int id)
        {
            var lyric = _usersProvider.ReadById(id);
            return req.CreateResponse(HttpStatusCode.OK, lyric);
        }


        [HttpPut, Route("passwordResetRequest")]
        public async Task<HttpResponseMessage> SendPasswordResetEmail(User request)
        {
            var result = await _sendGridProvider.SendPasswordReset(request);

            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpPost, Route("sendValidation")]
        public async Task<HttpResponseMessage> SendVerificationEmail(User user)
        {
            var response =await _sendGridProvider.SendVerification(user);
            return req.CreateResponse(HttpStatusCode.OK, response);
        }

        [HttpPut, Route("{id:int}")]
        public HttpResponseMessage UpdateById(UsersUpdateRequest request, int id)
        {
            var retId = _usersProvider.UpdateUser(request, id);
            return Request.CreateResponse(HttpStatusCode.OK, retId);
        }

        [HttpPut, Route("updatePassword")]
        public HttpResponseMessage UpdatePassword(UsersUpdateRequest request)
        {
            var result = _usersProvider.UpdatePassword(request);
            if (!result)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "User or Password does not match current data.");
            }
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }
    }
}