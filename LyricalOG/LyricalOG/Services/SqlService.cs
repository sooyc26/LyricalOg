using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace myCrudApp.Services
{
    public class SqlService
    {
        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;

        public SqlConnection connection { get; set; }
        public Dictionary<string,object> Parameters { get; set; }
        public SqlService()
        {
            connection = new SqlConnection(connString);
            Parameters = new Dictionary<string, object>();
        }

        public void AddParameter(string key, object val)
        {
            Parameters.Add(key, val);
        }

        public void ExecuteNonQuery(string commandText)
        {
            using (connection)
            {
                connection.Open();

                var cmd = connection.CreateCommand();
                cmd.CommandText = commandText;
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                foreach (var x in Parameters)
                {
                    cmd.Parameters.AddWithValue(x.Key, x.Value);
                }
                cmd.ExecuteNonQuery();

                connection.Close();
            }
        }

        public SqlDataReader ExecuteReader(string commandText)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = commandText;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            foreach (var x in Parameters)
            {
                cmd.Parameters.AddWithValue(x.Key, x.Value);
            }
            return cmd.ExecuteReader();
        }
    }
}