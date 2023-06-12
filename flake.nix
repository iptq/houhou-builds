{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, fenix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ fenix.overlays.default ];
        };

        toolchain = pkgs.fenix.stable;

        libraries = with pkgs; [
          webkitgtk
          gtk3
          cairo
          gdk-pixbuf
          glib.out
          dbus.lib
          openssl.out
          libayatana-appindicator
        ];

        packages = with pkgs; [
          pkg-config
          dbus
          openssl
          glib
          gtk3
          libsoup
          webkitgtk
          appimagekit
        ];
      in {
        devShell = pkgs.mkShell {
          buildInputs = packages;

          packages = (with pkgs; [ ]) ++ (with toolchain; [
            rustc
            cargo
            # rust-analyzer
            # rust-src
            # rust-std

            # Get the nightly version of rustfmt so we can wrap comments
            pkgs.fenix.default.rustfmt
          ]);

          shellHook = let
            joinLibs = libs:
              builtins.concatStringsSep ":" (builtins.map (x: "${x}/lib") libs);
            libs = joinLibs libraries;
          in ''
            export LD_LIBRARY_PATH=${libs}:$LD_LIBRARY_PATH
          '';
        };
      });
}
