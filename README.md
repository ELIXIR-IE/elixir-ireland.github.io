# ELIXIR Ireland Website

This is the official GitHub repository of [ELIXIR Ireland](https://elixir-ireland.ie).

## Prerequisites

- Ruby (version 2.7 or higher)
- RubyGems
- GCC and Make

## Initial Setup

### 1. Install Ruby

Check if Ruby is installed on your machine:
```bash
ruby --version
```

If not installed, install Ruby:
- **Ubuntu/Debian**: `sudo apt-get install ruby-full build-essential zlib1g-dev`
- **macOS**: `brew install ruby`
- **Windows**: Use [RubyInstaller](https://rubyinstaller.org/)

### 2. Install Bundler

```bash
gem install bundler
```

### 3. Clone the Repository

```bash
git clone https://github.com/elixir-ireland/elixir-ireland.github.io.git
cd elixir-ireland.github.io
```

### 4. Install Dependencies

```bash
bundle install
```

## Directory Structure
The website has been restructured to follow standard practices:
- **`assets/`**: Contains `css`, `js`, `images`, and `fonts`.
- **Pages**: Each page resides in its own directory (e.g., `about/index.html`) for clean URLs.
- **`index.html`**: The main entry point (formerly `home.html`).

## Local Development

### Run the Site Locally

```bash
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000` or equivalent as indicated by the command line output.

### Run with Live Reload

```bash
bundle exec jekyll serve --livereload
```

## Making Changes

### Content Updates

- **Pages**: Edit `index.html` files in the relevant page subdirectories.
- **Assets**: Edit files in the `assets/` directory.
- **Configuration**: Edit `_config.yml`
- **Posts**: Add/edit files in `_posts/` directory

## Deployment

### Deploy to GitHub Pages

The site automatically deploys when you push updates to the main branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Pages will automatically build and deploy the site within a few minutes using GitHub actions.


## Updating Dependencies

Keep Jekyll and gems up to date:

```bash
bundle update
```

## Troubleshooting

### Permission Errors

If you encounter permission errors when installing gems:

```bash
bundle install --path vendor/bundle
```

### Port Already in Use

Specify a different port:

```bash
bundle exec jekyll serve --port 4001
```

### Clear Cache

If changes aren't appearing:

```bash
bundle exec jekyll clean
bundle exec jekyll serve
```

## Issue Reports and Suggestions

If you have identified an issue or have any suggestions to improve the site, please [open an issue](https://github.com/elixir-ireland/elixir-ireland.github.io/issues/new) or [create a pull request](https://github.com/elixir-ireland/elixir-ireland.github.io/pulls).

## License
This project is maintained by ELIXIR Ireland.
