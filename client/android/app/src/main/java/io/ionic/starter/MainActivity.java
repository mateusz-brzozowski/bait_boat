package io.ionic.starter;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = (WebView) this.bridge.getWebView();
        webView.getSettings().setMixedContentMode(0);
    }
}