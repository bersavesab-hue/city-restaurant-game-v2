package com.cityrestaurant.mobileui;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public final class MainActivity extends Activity {
    private static final int REQUEST_FILE_CHOOSER = 1001;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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

        webView = new WebView(this);

        WebSettings settings =
            webView.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        webView.setWebViewClient(
            new WebViewClient()
        );

        webView.setWebChromeClient(
            new WebChromeClient() {
                @Override
                public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> callback,
                    FileChooserParams params
                ) {
                    if (filePathCallback != null) {
                        filePathCallback.onReceiveValue(null);
                    }

                    filePathCallback = callback;

                    Intent intent =
                        params.createIntent();

                    try {
                        startActivityForResult(
                            intent,
                            REQUEST_FILE_CHOOSER
                        );
                        return true;
                    } catch (Exception error) {
                        filePathCallback = null;
                        return false;
                    }
                }
            }
        );

        webView.setBackgroundColor(
            0xFF17130F
        );

        setContentView(webView);

        webView.loadUrl(
            "file:///android_asset/index.html"
        );
    }

    @Override
    protected void onActivityResult(
        int requestCode,
        int resultCode,
        Intent data
    ) {
        if (
            requestCode == REQUEST_FILE_CHOOSER &&
            filePathCallback != null
        ) {
            Uri[] results =
                WebChromeClient
                    .FileChooserParams
                    .parseResult(
                        resultCode,
                        data
                    );

            filePathCallback
                .onReceiveValue(
                    results
                );

            filePathCallback = null;
            return;
        }

        super.onActivityResult(
            requestCode,
            resultCode,
            data
        );
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (hasFocus) {
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
    protected void onDestroy() {
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
            filePathCallback = null;
        }

        if (webView != null) {
            webView.destroy();
            webView = null;
        }

        super.onDestroy();
    }
}
