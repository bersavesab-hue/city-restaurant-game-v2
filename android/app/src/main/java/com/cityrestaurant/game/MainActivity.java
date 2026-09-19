package com.cityrestaurant.game;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView gameView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        gameView = new WebView(this);

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

        gameView.loadUrl(
                "file:///android_asset/index.html"
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
