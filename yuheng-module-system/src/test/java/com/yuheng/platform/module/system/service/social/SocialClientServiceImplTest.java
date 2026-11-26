package com.yuheng.platform.module.system.service.social;

import com.yuheng.platform.framework.common.exception.ServiceException;
import com.yuheng.platform.module.system.dal.mysql.social.SocialClientMapper;
import com.yuheng.platform.module.system.framework.justauth.core.AuthRequestFactory;
import me.zhyd.oauth.request.AuthRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialClientServiceImplTest {

    @Mock
    private AuthRequestFactory authRequestFactory;
    @Mock
    private SocialClientMapper socialClientMapper;
    @Mock
    private AuthRequest authRequest;

    @InjectMocks
    private SocialClientServiceImpl service;

    @Test
    void shouldRejectUnknownSocialTypeBeforeBuildingAuthRequest() {
        ServiceException exception = assertThrows(ServiceException.class,
                () -> service.getAuthorizeUrl(999, 1, "http://127.0.0.1/callback"));

        assertEquals(400, exception.getCode());
        verifyNoInteractions(authRequestFactory, socialClientMapper);
    }

    @Test
    void shouldConvertAuthorizeRequestConstructionExceptionToSocialAuthFailure() {
        when(authRequestFactory.get("GITEE"))
                .thenThrow(new IllegalStateException("provider configuration unavailable"));

        ServiceException exception = assertThrows(ServiceException.class,
                () -> service.getAuthorizeUrl(10, 1, "http://127.0.0.1/callback"));

        assertEquals(1002018000, exception.getCode());
    }

    @Test
    void shouldConvertProviderExceptionToSocialAuthFailure() {
        when(authRequestFactory.get("GITEE")).thenReturn(authRequest);
        when(authRequest.login(org.mockito.ArgumentMatchers.any()))
                .thenThrow(new IllegalStateException("provider unavailable"));

        ServiceException exception = assertThrows(ServiceException.class,
                () -> service.getAuthUser(10, 1, "invalid-code", "invalid-state"));

        assertEquals(1002018000, exception.getCode());
    }

    @Test
    void shouldConvertAuthRequestConstructionExceptionToSocialAuthFailure() {
        when(authRequestFactory.get("GITEE"))
                .thenThrow(new IllegalStateException("provider configuration unavailable"));

        ServiceException exception = assertThrows(ServiceException.class,
                () -> service.getAuthUser(10, 1, "invalid-code", "invalid-state"));

        assertEquals(1002018000, exception.getCode());
    }
}
