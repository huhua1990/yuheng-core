package com.yuheng.platform.module.system.service.oauth2;

import com.yuheng.platform.module.system.dal.dataobject.oauth2.OAuth2AccessTokenDO;
import com.yuheng.platform.module.system.dal.dataobject.oauth2.OAuth2CodeDO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2GrantServiceImplTest {

    @Mock
    private OAuth2TokenService oauth2TokenService;
    @Mock
    private OAuth2CodeService oauth2CodeService;
    @Mock
    private OAuth2CodeDO codeDO;

    @InjectMocks
    private OAuth2GrantServiceImpl service;

    @Test
    void shouldKeepAuthorizationCodeWhenRedirectUriDoesNotMatch() {
        when(oauth2CodeService.getAuthorizationCodeForUpdate("code")).thenReturn(codeDO);
        when(codeDO.getClientId()).thenReturn("client");
        when(codeDO.getRedirectUri()).thenReturn("https://client.example/callback");

        assertThrows(RuntimeException.class, () -> service.grantAuthorizationCodeForAccessToken(
                "client", "code", "https://attacker.example/callback", "state"));

        verify(oauth2CodeService, never()).deleteAuthorizationCode(codeDO.getId());
        verify(oauth2TokenService, never()).createAccessToken(
                codeDO.getUserId(), codeDO.getUserType(), codeDO.getClientId(), codeDO.getScopes());
    }

    @Test
    void shouldKeepAuthorizationCodeWhenStateDoesNotMatch() {
        when(oauth2CodeService.getAuthorizationCodeForUpdate("code")).thenReturn(codeDO);
        when(codeDO.getClientId()).thenReturn("client");
        when(codeDO.getRedirectUri()).thenReturn("https://client.example/callback");
        when(codeDO.getState()).thenReturn("expected-state");

        assertThrows(RuntimeException.class, () -> service.grantAuthorizationCodeForAccessToken(
                "client", "code", "https://client.example/callback", "wrong-state"));

        verify(oauth2CodeService, never()).deleteAuthorizationCode(codeDO.getId());
        verify(oauth2TokenService, never()).createAccessToken(
                codeDO.getUserId(), codeDO.getUserType(), codeDO.getClientId(), codeDO.getScopes());
    }

    @Test
    void shouldDeleteAuthorizationCodeOnlyAfterAllBindingsMatch() {
        List<String> scopes = List.of("user.read");
        OAuth2AccessTokenDO accessToken = new OAuth2AccessTokenDO();
        when(oauth2CodeService.getAuthorizationCodeForUpdate("code")).thenReturn(codeDO);
        when(codeDO.getId()).thenReturn(42L);
        when(codeDO.getClientId()).thenReturn("client");
        when(codeDO.getRedirectUri()).thenReturn("https://client.example/callback");
        when(codeDO.getState()).thenReturn("state");
        when(codeDO.getUserId()).thenReturn(7L);
        when(codeDO.getUserType()).thenReturn(1);
        when(codeDO.getScopes()).thenReturn(scopes);
        when(oauth2TokenService.createAccessToken(7L, 1, "client", scopes)).thenReturn(accessToken);

        OAuth2AccessTokenDO result = service.grantAuthorizationCodeForAccessToken(
                "client", "code", "https://client.example/callback", "state");

        verify(oauth2CodeService).deleteAuthorizationCode(42L);
        verify(oauth2TokenService).createAccessToken(7L, 1, "client", scopes);
        org.junit.jupiter.api.Assertions.assertSame(accessToken, result);
    }
}
