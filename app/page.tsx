"use client";

import { CloseIcon } from "../components/CloseIcon";
import { NoAgentNotification } from "../components/NoAgentNotification";
import {
  AgentState,
  BarVisualizer,
  DisconnectButton,
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { AnimatePresence, motion } from "framer-motion";
import { MediaDeviceFailure } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import type { ConnectionDetails } from "./api/connection-details/route";
import { Linkedin } from "lucide-react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";

export default function Page() {
  const [connectionDetails, updateConnectionDetails] = useState<ConnectionDetails | undefined>(
    undefined
  );
  const [agentState, setAgentState] = useState<AgentState>("disconnected");

  const onConnectButtonClicked = useCallback(async () => {
    // Generate room connection details, including:
    //   - A random Room name
    //   - A random Participant name
    //   - An Access Token to permit the participant to join the room
    //   - The URL of the LiveKit server to connect to
    //
    // In real-world application, you would likely allow the user to specify their
    // own participant name, and possibly to choose from existing rooms to join.

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/voice/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData = await response.json();
    updateConnectionDetails(connectionDetailsData);
  }, []);

  return (
    <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
       <Card className="max-w-lg mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary/10">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile picture" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">Aaron Redmond</CardTitle>
            <CardDescription className="text-lg">Solution Architect</CardDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">ai</Badge>
              <Badge variant="secondary">react</Badge>
              
              <Badge variant="secondary">dotnet</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={connectionDetails !== undefined}
        audio={true}
        video={false}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={() => {
          updateConnectionDetails(undefined);
        }}
        className="grid grid-rows-[2fr_1fr] items-center"
      >
        <SimpleVoiceAssistant onStateChange={setAgentState} />
        <ControlBar onConnectButtonClicked={onConnectButtonClicked} agentState={agentState} />
        <RoomAudioRenderer />
        <NoAgentNotification state={agentState} />
      </LiveKitRoom>
      </CardContent>
      <CardFooter className="flex justify-center gap-3 pt-2">
        <a href="https://github.com/Aaron-Redmond" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Button>
        </a>
        <a href="https://www.linkedin.com/in/aaron-redmond-06325823/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Linkedin className="h-4 w-4" />
            <span className="sr-only">LinkedIn</span>
          </Button>
        </a>
        <a href="https://twitter.com/_aaronredmond" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </Button>
        </a>
      </CardFooter>
      </Card>
    </main>
  );
}

function SimpleVoiceAssistant(props: { onStateChange: (state: AgentState) => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);
  return (
    <div className="h-[300px] max-w-[90vw] mx-auto">
      <BarVisualizer
        state={state}
        barCount={4}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar(props: { onConnectButtonClicked: () => void; agentState: AgentState }) {
  /**
   * Use Krisp background noise reduction when available.
   * Note: This is only available on Scale plan, see {@link https://livekit.io/pricing | LiveKit Pricing} for more details.
   */
  const krisp = useKrispNoiseFilter();
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, []);

  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={() => props.onConnectButtonClicked()}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {props.agentState !== "disconnected" && props.agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
