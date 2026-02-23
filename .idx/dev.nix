# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.python312Packages.pip
    pkgs.python312Full
    pkgs.nodejs_20
    pkgs.awscli2
    pkgs.aws-sam-cli
  ];

  # Sets environment variables in the workspace
  env = {
    VITE_DEV_MODE = "true";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "ms-python.python"
      "dsznajder.es7-react-js-snippets"
      "dbaeumer.vscode-eslint"
    ];

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Install frontend dependencies
        npm-install = "cd frontend && npm install";
        # Install backend dependencies
        pip-install = "cd backend && pip install -r requirements.txt";
      };
      # Runs when a workspace is (re)started
      onStart = {
        # Optional: Start frontend automatically
        # start-frontend = "cd frontend && npm run dev";
      };
    };

    # Preview configuration
    previews = {
      enable = true;
      previews = {
        web = {
          # Example: run "npm run dev" with PORT set to IDX's defined port for previews
          command = ["npm" "run" "dev" "--prefix" "frontend" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
          env = {
            # Environment variables for the preview process
            VITE_DEV_MODE = "true";
          };
        };
      };
    };
  };
}
