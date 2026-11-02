module.exports = {
  forbidden: [
    {
      name: "domain-must-stay-pure",
      comment: "El dominio no depende de frameworks, red, Supabase ni del reloj global.",
      severity: "error",
      from: { path: "^src[\\\\/]domain" },
      to: {
        path: "(^|[\\\\/])(next|react|@supabase|supabase|fetch)([\\\\/]|$)",
        pathNot: "^$"
      }
    },
    {
      name: "domain-must-not-call-date-now",
      severity: "error",
      from: { path: "^src[\\\\/]domain" },
      to: { path: "^Date$" }
    },
    {
      name: "application-must-not-depend-on-infrastructure",
      severity: "error",
      from: { path: "^src[\\\\/]application" },
      to: { path: "^src[\\\\/]infrastructure" }
    },
    {
      name: "infrastructure-must-not-depend-on-ui",
      severity: "error",
      from: { path: "^src[\\\\/]infrastructure" },
      to: { path: "^src[\\\\/](app|components)[\\\\/]" }
    }
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true
  }
};
