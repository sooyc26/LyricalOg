using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LyricalOG.Interfaces
{
    public interface IS3RecordProvider
    {
        int DeleteObjectNonVersionedBucketAsync(string objName);
    }
}
