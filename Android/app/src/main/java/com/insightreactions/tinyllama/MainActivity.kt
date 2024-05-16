package com.insightreactions.tinyllama

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.github.druk.dnssd.BrowseListener
import com.github.druk.dnssd.DNSSDEmbedded
import com.github.druk.dnssd.DNSSDService
import com.github.druk.dnssd.QueryListener
import com.github.druk.dnssd.ResolveListener
import com.insightreactions.tinyllama.ui.theme.TinyLlamaTheme
import java.net.InetAddress

class MainActivity : ComponentActivity() {
    private val TAG = "TinyLlamaApp"
    private var dnssd: DNSSDEmbedded? = null
    private var tlSub: DNSSDService? = null

    private fun onTinyLlamaServiceFound(ipAddress: String) {
        tlSub?.stop()
        tlSub = null
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("http://$ipAddress"))
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        startActivity(intent)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        dnssd = DNSSDEmbedded(this)
        enableEdgeToEdge()
        setContent {
            TinyLlamaTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Greeting(
                            name = "Android",
                            modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (dnssd != null && tlSub == null) {
            tlSub = dnssd!!.browse("_http._tcp", object : BrowseListener {
                override fun operationFailed(p0: DNSSDService?, p1: Int) {
                    Log.e(TAG, "$p0 $p1")
                }

                override fun serviceFound(browser: DNSSDService?, flags: Int, ifIndex: Int, serviceName: String?, regType: String?, domain: String?) {
                    Log.d(TAG, "Found service: $serviceName")
                    if (serviceName != "Tiny Llama") {
                        return;
                    }
                    dnssd?.resolve(flags, ifIndex, serviceName, regType, domain, object : ResolveListener {
                        override fun operationFailed(p0: DNSSDService?, p1: Int) {
                            Log.e(TAG, "Failed to resolve Tiny Llama service")
                        }

                        override fun serviceResolved(resolver: DNSSDService?, flags: Int, ifIndex: Int, fullName: String?, hostName: String?, port: Int, txtRecord: MutableMap<String, String>?) {
                            Log.d(TAG, "Tiny Llama Service resolved: $resolver $flags $ifIndex $fullName $hostName $port")
                            dnssd?.queryRecord(0, ifIndex, hostName, 1, 1, object : QueryListener {
                                override fun operationFailed(service: DNSSDService?, errorCode: Int) {
                                    Log.e(TAG, "Querying records failed for service: $service $errorCode")
                                }

                                override fun queryAnswered(query: DNSSDService?, flags: Int, ifIndex: Int, fullName: String?, rrtype: Int, rrclass: Int, rdata: ByteArray?, ttl: Int) {
                                    Log.d(TAG, "Query Address: $fullName")
                                    val address = InetAddress.getByAddress(rdata).hostAddress
                                    if (address != null) {
                                        onTinyLlamaServiceFound(address)
                                    }
                                }
                            })
                        }
                    })
                }

                override fun serviceLost(
                    browser: DNSSDService?,
                    flags: Int,
                    ifIndex: Int,
                    serviceName: String?,
                    regType: String?,
                    domain: String?
                ) {
                    Log.d(TAG, "Service Lost: $serviceName $regType")
                }
            })
        }
    }

    override fun onPause() {
        super.onPause()
        if (tlSub != null) {
            tlSub!!.stop()
            tlSub = null
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
            text = "Hello $name!",
            modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    TinyLlamaTheme {
        Greeting("Android")
    }
}