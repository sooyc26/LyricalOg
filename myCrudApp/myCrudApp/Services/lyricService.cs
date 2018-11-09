using myCrudApp.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace myCrudApp.Services
{
    public class LyricService
    {
        public int Create(LyricsCreateRequest request)
        {
            int id=0;
            string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Insert";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        id = (int)reader["Id"];
                    }
                }
            }
            return id;
        }
    }
}