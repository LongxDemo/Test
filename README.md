# Demo Money Tracker

This is a modern and intuitive application to track your income and expenses, helping you gain control over your financial life with insightful visualizations.

## How it Works (No Build Step Required!)

This project is set up to run directly in the browser without a "build" step. It uses **Babel Standalone** to transpile the TSX (TypeScript + JSX) code into plain JavaScript on the fly. This makes it very simple to deploy to static hosting services like GitHub Pages.

## How to Deploy to GitHub Pages

This project is configured to be easily deployed as a static site on GitHub Pages. Follow these steps to get your own version live.

### Step 1: Create a GitHub Repository

1.  Go to [github.com/new](https://github.com/new).
2.  Give your repository a name (e.g., `money-tracker`).
3.  Choose whether you want it to be public or private.
4.  Click "Create repository".

### Step 2: Push Your Code to the Repository

1.  Open your terminal or command prompt.
2.  Initialize a git repository in your project folder if you haven't already:
    ```bash
    git init -b main
    ```
3.  Add all your project files to the staging area:
    ```bash
    git add .
    ```
4.  Commit the files:
    ```bash
    git commit -m "Initial commit"
    ```
5.  Link your local repository to the one you created on GitHub:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    ```
    (Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.)

6.  Push your code to the `main` branch on GitHub:
    ```bash
    git push -u origin main
    ```

### Step 3: Enable GitHub Pages

1.  In your repository on GitHub, go to the **Settings** tab.
2.  In the left sidebar, click on **Pages**.
3.  Under the "Build and deployment" section, for the **Source**, select **Deploy from a branch**.
4.  Under "Branch", select `main` as the branch and `/ (root)` as the folder.
5.  Click **Save**.

### Step 4: Access Your Deployed App

GitHub will take a minute or two to build and deploy your site. After you push your changes, **wait a few minutes** for the deployment to complete. Once it's ready, the settings page will display a link to your live application. It will look something like this:

`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

---

## Troubleshooting

### "Blank White Screen"

If you see a blank page, it's often because the JavaScript code didn't run.
1.  Open the browser's Developer Tools (usually by pressing F12 or Ctrl+Shift+I).
2.  Check the **Console** tab for any red error messages. This will give you a clue about what went wrong.
3.  The most common issue was that the browser can't run TSX files directly. The changes I just made fix this by using Babel to transpile the code in your browser.

### "404 Not Found" Errors

You mentioned seeing `404` errors for files like `index.css` or `vite.svg`. This happens when the browser can't find a file at the path specified.

1.  **Relative Paths:** This project is now set up to use relative paths (`./index.tsx`), which works correctly on GitHub Pages. If you add new assets (like images or CSS files), make sure you link to them with relative paths.
2.  **Old Files:** The errors for `vite.svg` suggest you might have deployed files from an old project template. Make sure your repository only contains the files for *this* project.
3.  **Cache:** Sometimes your browser caches old versions of your files. After deploying a fix, do a "hard refresh" (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac) or clear your browser cache for the site.
4.  **Deployment Time:** It can take a few minutes for GitHub Pages to update after you push new code. Be patient and refresh the page after a while.