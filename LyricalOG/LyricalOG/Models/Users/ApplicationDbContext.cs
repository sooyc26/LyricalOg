using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models.Users
{
    public class ApplicationDbContext : IdentityDbContext<UserIdentity>
    {
        public ApplicationDbContext(DbContextOptions options)
            //: base(options)
        {
        }

        public DbSet<UserLogin> Customers { get; set; }
    }
}