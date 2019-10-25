using LyricalOG.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LyricalOG.Interfaces
{
    public interface IBeatProvider
    {
        List<Beat> ReadAll();
        Beat ReadById(int id );
        BeatCreateResponse Create(Beat request);
        int Delete(int id);
        int Update(Beat request);
    }
}
