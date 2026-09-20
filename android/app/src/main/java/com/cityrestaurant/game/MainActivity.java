package com.cityrestaurant.game;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
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

        gameView.setOnApplyWindowInsetsListener(
                (view, insets) -> {
                    int top;
                    int bottom;

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                        android.graphics.Insets bars =
                                insets.getInsets(
                                        WindowInsets.Type.systemBars()
                                );
                        top = bars.top;
                        bottom = bars.bottom;
                    } else {
                        top = insets.getSystemWindowInsetTop();
                        bottom = insets.getSystemWindowInsetBottom();
                    }

                    view.setPadding(0, top, 0, bottom);
                    return insets;
                }
        );

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
        gameView.requestApplyInsets();

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

    @Override
    protected void onResume() {
        super.onResume();

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
