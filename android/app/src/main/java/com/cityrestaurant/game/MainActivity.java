package com.cityrestaurant.game;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.view.DisplayCutout;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

public class MainActivity extends Activity {

    private static final int IMMERSIVE_FLAGS =
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;

    private static final long[] IMMERSIVE_RETRY_DELAYS_MS =
            new long[] {
                    120L,
                    600L,
                    1400L
            };

    private WebView gameView;

    private float nativeSafeTop = 0f;
    private float nativeSafeRight = 0f;
    private float nativeSafeBottom = 0f;
    private float nativeSafeLeft = 0f;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        configureImmersiveWindow();

        gameView = new WebView(this);
        gameView.setBackgroundColor(Color.BLACK);
        gameView.setPadding(0, 0, 0, 0);
        gameView.setFitsSystemWindows(false);

        gameView.setOnSystemUiVisibilityChangeListener(
                visibility -> {
                    int required =
                            View.SYSTEM_UI_FLAG_FULLSCREEN
                                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;

                    if ((visibility & required) != required) {
                        scheduleImmersiveReapply();
                    }
                }
        );

        WebSettings settings = gameView.getSettings();

        WebView.setWebContentsDebuggingEnabled(false);

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);

        gameView.setWebViewClient(
                new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);
                        applyNativeSafeInsetsToWebView();
                        applyImmersiveMode();
                        scheduleImmersiveReapply();
                    }
                }
        );

        gameView.setOnApplyWindowInsetsListener(
                (view, insets) -> {
                    updateNativeSafeInsets(insets);
                    applyNativeSafeInsetsToWebView();

                    if (areSystemBarsVisible(insets)) {
                        scheduleImmersiveReapply();
                    }

                    return insets;
                }
        );

        gameView.setVerticalScrollBarEnabled(false);
        gameView.setHorizontalScrollBarEnabled(false);

        setContentView(gameView);

        applyImmersiveMode();
        scheduleImmersiveReapply();

        gameView.loadUrl("file:///android_asset/index.html");
        gameView.requestApplyInsets();
    }

    private void configureImmersiveWindow() {
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setStatusBarContrastEnforced(false);
            getWindow().setNavigationBarContrastEnforced(false);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attributes =
                    getWindow().getAttributes();

            attributes.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams
                            .LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;

            getWindow().setAttributes(attributes);
        }
    }

    private boolean areSystemBarsVisible(WindowInsets windowInsets) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            return windowInsets.isVisible(
                    WindowInsets.Type.statusBars()
            ) || windowInsets.isVisible(
                    WindowInsets.Type.navigationBars()
            );
        }

        return windowInsets.getSystemWindowInsetTop() > 0
                || windowInsets.getSystemWindowInsetBottom() > 0;
    }

    private void updateNativeSafeInsets(WindowInsets windowInsets) {
        int left = 0;
        int top = 0;
        int right = 0;
        int bottom = 0;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Insets systemBars =
                    windowInsets.getInsets(
                            WindowInsets.Type.systemBars()
                    );

            Insets cutoutInsets =
                    windowInsets.getInsetsIgnoringVisibility(
                            WindowInsets.Type.displayCutout()
                    );

            left = Math.max(systemBars.left, cutoutInsets.left);
            top = Math.max(systemBars.top, cutoutInsets.top);
            right = Math.max(systemBars.right, cutoutInsets.right);
            bottom = Math.max(systemBars.bottom, cutoutInsets.bottom);
        } else {
            left = windowInsets.getSystemWindowInsetLeft();
            top = windowInsets.getSystemWindowInsetTop();
            right = windowInsets.getSystemWindowInsetRight();
            bottom = windowInsets.getSystemWindowInsetBottom();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                DisplayCutout cutout =
                        windowInsets.getDisplayCutout();

                if (cutout != null) {
                    left = Math.max(left, cutout.getSafeInsetLeft());
                    top = Math.max(top, cutout.getSafeInsetTop());
                    right = Math.max(right, cutout.getSafeInsetRight());
                    bottom = Math.max(bottom, cutout.getSafeInsetBottom());
                }
            }
        }

        float density =
                getResources()
                        .getDisplayMetrics()
                        .density;

        if (density <= 0f) {
            density = 1f;
        }

        nativeSafeLeft = left / density;
        nativeSafeTop = top / density;
        nativeSafeRight = right / density;
        nativeSafeBottom = bottom / density;
    }

    private void applyNativeSafeInsetsToWebView() {
        if (gameView == null) {
            return;
        }

        String script =
                String.format(
                        Locale.US,
                        "(function(){"
                                + "var root=document.documentElement;"
                                + "if(!root){return;}"
                                + "root.style.setProperty('--ui-native-safe-top','%.2fpx');"
                                + "root.style.setProperty('--ui-native-safe-right','%.2fpx');"
                                + "root.style.setProperty('--ui-native-safe-bottom','%.2fpx');"
                                + "root.style.setProperty('--ui-native-safe-left','%.2fpx');"
                                + "})();",
                        nativeSafeTop,
                        nativeSafeRight,
                        nativeSafeBottom,
                        nativeSafeLeft
                );

        gameView.evaluateJavascript(script, null);
    }

    private void applyImmersiveMode() {
        configureImmersiveWindow();

        View decorView =
                getWindow()
                        .getDecorView();

        decorView.setSystemUiVisibility(IMMERSIVE_FLAGS);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller =
                    getWindow().getInsetsController();

            if (controller != null) {
                controller.hide(WindowInsets.Type.systemBars());

                controller.setSystemBarsBehavior(
                        WindowInsetsController
                                .BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );

                controller.setSystemBarsAppearance(
                        0,
                        WindowInsetsController
                                .APPEARANCE_LIGHT_STATUS_BARS
                                | WindowInsetsController
                                    .APPEARANCE_LIGHT_NAVIGATION_BARS
                );
            }
        }
    }

    private void scheduleImmersiveReapply() {
        if (gameView == null) {
            return;
        }

        for (long delay : IMMERSIVE_RETRY_DELAYS_MS) {
            gameView.postDelayed(
                    this::applyImmersiveMode,
                    delay
            );
        }
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
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (hasFocus) {
            applyImmersiveMode();
            scheduleImmersiveReapply();

            if (gameView != null) {
                gameView.requestApplyInsets();
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        applyImmersiveMode();

        if (gameView != null) {
            gameView.resumeTimers();
            gameView.onResume();
            gameView.requestApplyInsets();
            scheduleImmersiveReapply();
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
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
