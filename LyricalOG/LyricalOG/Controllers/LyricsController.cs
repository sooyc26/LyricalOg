using LyricalOG.Interfaces;
using LyricalOG.Models;
using LyricalOG.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace LyricalOG.Controllers
{
    [AllowAnonymous]
    [RoutePrefix("api")]
    //[EnableCors(origins: "*", headers: "*", methods: "*")]
    public class LyricsController : ApiController
    {
        private readonly ILyricsProvider _lyricsProvider;
        private readonly IS3RecordProvider _recordProvider;
        private readonly IUsersProvider _userProvider;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();
        public LyricsController(ILyricsProvider l,IS3RecordProvider r,IUsersProvider u)
        {
            _lyricsProvider = l;
            _recordProvider = r;
            _userProvider = u;
            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        [HttpPost, Route("lyrics")]
        public HttpResponseMessage Create(LyricsCreateRequest request)
        {
            if (request == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            var response = _lyricsProvider.Create(request);

            return req.CreateResponse(HttpStatusCode.OK, response);
        }

        [HttpGet, Route("lyrics")]
        public HttpResponseMessage ReadAll()
        {
            var lyrics = _lyricsProvider.ReadAll();
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }

        [HttpGet, Route("lyrics/{id:int}")]
        public HttpResponseMessage ReadById(int id)
        {
            var lyric = _lyricsProvider.ReadById(id);
            return req.CreateResponse(HttpStatusCode.OK, lyric);
        }
        [HttpGet, Route("lyrics/beat/{id:int}")]
        public HttpResponseMessage ReadByBeatId(int id)
        {
            var lyrics = _lyricsProvider.ReadByBeatId(id);
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }
        //[HttpPut, Route("lyrics/{id:int}")]
        //public HttpResponseMessage UpdateById(LyricsUpdateRequest request, int id)
        //{
        //    var retId = _lyricService.UpdateLyrics(request, id);
        //    return Request.CreateResponse(HttpStatusCode.OK, retId);
        //}

        [HttpGet, Route("lyrics/vote/{id:int}")]
        public HttpResponseMessage UpdateVotes( int id)
        {
            var retId = _lyricsProvider.UpdateVotes(id);
            return Request.CreateResponse(HttpStatusCode.OK, retId);
        }

        [HttpDelete, Route("lyrics/{id:int}")]
        public HttpResponseMessage Delete(int id)
        {
            _recordProvider.DeleteObjectNonVersionedBucketAsync(id);

            var retId =_lyricsProvider.Delete(id);
            var message = "deleted Id: " + retId;
            return Request.CreateResponse(HttpStatusCode.OK, message);
        }
    }
}