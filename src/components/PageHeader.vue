<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from 'vue-clerk'
import { LogIn } from 'lucide-vue-next'
import ButtonComponent from './ButtonComponent.vue';

const { isSignedIn } = useAuth()
defineProps<{ label: string }>()
defineEmits(['return'])
</script>

<template>
    <header class="not-printable">
        <div class="border-b flex flex-col gap-y-4 md:flex-row p-4 w-full justify-between items-center">
            <div class="flex flex-row gap-4 items-center">
                <SignedIn>

                    <UserButton></UserButton>
                </SignedIn>

                <h1 @click="$emit('return')" class="font-bold text-lg cursor-pointer">{{ isSignedIn ? label : 'WorkTime'
                    }}</h1>
            </div>

            <div class="w-1/3 min-w-fit h-full" v-if="$slots.search && isSignedIn">
                <slot name="search"></slot>
            </div>
            <div v-if="$slots.action && isSignedIn" class="flex flex-row gap-2 h-full ">


                <slot name="action"></slot>

            </div>
            <SignedOut>
                <SignInButton>
                    <ButtonComponent outlined label="Sign In">
                        <template #prefix>
                            <LogIn class="size-4"></LogIn>
                        </template>
                    </ButtonComponent>
                </SignInButton>
            </SignedOut>
        </div>
    </header>
</template>