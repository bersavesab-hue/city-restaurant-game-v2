package com.cityrestaurant.game;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView gameView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        gameView = new WebView(this);
        gameView.setBackgroundColor(
                Color.rgb(4, 75, 145)
        );

        gameView.setPadding(0, 0, 0, 0);
        applyImmersiveMode();

        WebSettings settings =
                gameView.getSettings();

        WebView.setWebContentsDebuggingEnabled(false);

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // The game is packaged entirely under android_asset.
        // Keep local asset loading enabled, but do not expose
        // content providers or cross-origin file access.
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(
                WebSettings.MIXED_CONTENT_NEVER_ALLOW
        );

        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);

        gameView.setWebViewClient(
                new WebViewClient()
        );

        gameView.setVerticalScrollBarEnabled(false);
        gameView.setHorizontalScrollBarEnabled(false);

        setContentView(gameView);
        applyImmersiveMode();

        gameView.loadUrl(
                "file:///android_asset/index.html"
        );
    }

    @Override
    protected void onPause() {
        if (gameView != null) {
            gameView.onPause();
            gameView.pauseTimers();
        }

        super.onPause();
    }

    private void applyImmersiveMode() {
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller =
                    getWindow().getInsetsController();

            if (controller != null) {
                controller.hide(
                        WindowInsets.Type.statusBars()
                                | WindowInsets.Type.navigationBars()
                );

                controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
        } else {
            getWindow()
                    .getDecorView()
                    .setSystemUiVisibility(
                            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    );
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (hasFocus) {
            applyImmersiveMode();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        applyImmersiveMode();

        if (gameView != null) {
            gameView.resumeTimers();
            gameView.onResume();
        }
    }

    @Override
    public void onBackPressed() {
        if (gameView == null) {
            super.onBackPressed();
            return;
        }

        gameView.evaluateJavascript(
                "(window.restaurantGameBack && window.restaurantGameBack()) ? 'true' : 'false';",
                value -> {
                    if (!"\"true\"".equals(value)) {
                        MainActivity.super.onBackPressed();
                    }
                }
        );
    }

    @Override
    protected void onDestroy() {
        if (gameView != null) {
            gameView.destroy();
            gameView = null;
        }

        super.onDestroy();
    }
}
