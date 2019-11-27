 using LyricalOG.Interfaces;
using LyricalOG.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Dispatcher;
using Unity;
using Unity.Injection;
using Unity.Lifetime;

namespace LyricalOG
{
    public static class WebApiConfig
    {
        [Obsolete]
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.Filters.Add(new AuthorizeAttribute());

            config.MapHttpAttributeRoutes();
            var cors = new EnableCorsAttribute("*", "*", "*");

            config.EnableCors(cors);

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            //dependency resolver register
            var container = new UnityContainer();

           // container.RegisterType<IUsersProvider, UserService>(new HierarchicalLifetimeManager());

            container.RegisterType<IUsersProvider>(
                new InjectionFactory(c => new UserService()));

            container.RegisterType<IS3RecordProvider>(
                new InjectionFactory(c => new RecordService()));

            container.RegisterType<ILyricsProvider>(
                 new InjectionFactory(c => new LyricService()));

            container.RegisterType<IBeatProvider>(
                new InjectionFactory(c => new BeatService()));
            //config.DependencyResolver = new UnityResolver(container);

            container.RegisterType<ISendGridProvider>(
                new InjectionFactory(c => new SendGridService()));
            config.DependencyResolver = new UnityResolver(container);
        }
    }
}
