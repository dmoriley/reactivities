using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain
{
    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; }
        
        // virtual to indicate property should be lazy loaded
        public virtual ICollection<UserActivity> UserActivities { get; set; }
    }
}
