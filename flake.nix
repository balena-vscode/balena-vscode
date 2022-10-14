{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    utils.url = "github:numtide/flake-utils";
    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
    dream2nix.url = "github:nix-community/dream2nix";
  };

  outputs = { self, nixpkgs, utils, flake-compat, dream2nix,  ... }: 
    utils.lib.eachDefaultSystem (system: 
      let
        pkgs = import nixpkgs { inherit system; };

        initD2N = dream2nix.lib.init {
          inherit pkgs;
          config.projectRoot = ./.;
        };

        buildInputs = with pkgs; [
            nodejs
            nodePackages.pnpm
        ];

      in rec {
         nodeProjects = initD2N.makeOutputs {
          source = ./.;
          settings = [
            {
              aggregate = true;
            }
            {
              subsystemInfo.nodejs = 18;
            }
          ];
        };

        defaultPackage = pkgs.stdenv.mkDerivation {
          name = "balena-vscode";
          src = "${nodeProjects.packages.balena-vscode}/lib/node_modules/balena-vscode/";
          installPhase = ''
            mkdir $out
            cp ${nodeProjects.packages.balena-vscode.name}.vsix $out
          '';
        };

        devShell = with pkgs; mkShell {
          buildInputs = [
            buildInputs
            qemu
          ];
        };
      }
    );
}
