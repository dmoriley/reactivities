using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Validators
{
    public static class ValidatorExtenstions
    {
        // this IRuleBuilder => this is the class were adding the extention method to
        public static IRuleBuilder<T, string>  Password<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            var options = ruleBuilder
                .NotEmpty()
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.")
                .Matches("[A-Z]").WithMessage("Password must have at least 1 upper case character.")
                .Matches("[a-z]").WithMessage("Password must have at least 1 lower case character.")
                .Matches("[0-9]").WithMessage("Password must contain at least 1 number.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain non alphanumeric character");

            return options;
        }
    }
}
