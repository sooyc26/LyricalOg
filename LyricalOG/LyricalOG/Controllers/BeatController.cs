﻿using LyricalOG.Interfaces;
using LyricalOG.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LyricalOG.Controllers
{
    [AllowAnonymous]
    [RoutePrefix("api")]
    public class BeatController : ApiController
    {
        private readonly IBeatProvider _beatProvider;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();

        public BeatController(IBeatProvider l)
        {
            _beatProvider = l;
            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        [HttpGet, Route("beats")]
        public HttpResponseMessage ReadAll()
        {
            var lyrics = _beatProvider.ReadAll();
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }
        [HttpGet, Route("beat/{id:int}")]
        public HttpResponseMessage ReadById(int id)
        {
            var lyrics = _beatProvider.ReadById(id);
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }

        [HttpPost, Route("beat")]
        public HttpResponseMessage Create(Beat request)
        {
            if (request == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            var response = _beatProvider.Create(request);

            return req.CreateResponse(HttpStatusCode.OK, response);
        }

        [HttpPut, Route("beat")]
        public HttpResponseMessage UpdateById(Beat request)
        {
            var retId = _beatProvider.Update(request);
            return Request.CreateResponse(HttpStatusCode.OK, retId);
        }

        [HttpDelete, Route("beat/{id:int}")]
        public HttpResponseMessage Delete(int id)
        {

            var retId = _beatProvider.Delete(id);
            var message = "deleted Id: " + retId;
            return Request.CreateResponse(HttpStatusCode.OK, message);
        }
    }
}