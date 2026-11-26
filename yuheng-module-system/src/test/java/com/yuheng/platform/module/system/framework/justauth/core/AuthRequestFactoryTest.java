package com.yuheng.platform.module.system.framework.justauth.core;

import com.xkcoding.justauth.autoconfigure.JustAuthProperties;
import me.zhyd.oauth.cache.AuthStateCache;
import me.zhyd.oauth.config.AuthConfig;
import me.zhyd.oauth.exception.AuthException;
import me.zhyd.oauth.request.AuthRequest;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class AuthRequestFactoryTest {

    @Test
    void shouldRejectUnsupportedProviderWithoutOptionalExtensionConfiguration() {
        JustAuthProperties properties = new JustAuthProperties();
        properties.setType(Map.of());
        AuthStateCache stateCache = mock(AuthStateCache.class);

        assertThrows(AuthException.class,
                () -> new AuthRequestFactory(properties, stateCache).get("GITEE"));

        // A missing optional extension block must not turn an unsupported
        // provider into a NullPointerException.
    }
}
