{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.awscli2
    pkgs.aws-sam-cli
    pkgs.python312Packages.pip
    pkgs.python312Full
  ];
  env = {
    VITE_DEV_MODE = "true";
  };
  idx = {
    extensions = [
      "ms-python.python"
      "dsznajder.es7-react-js-snippets"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
    ];
    workspace = {
      onCreate = {
        npm-install = "cd frontend && npm install";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--prefix" "frontend" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
